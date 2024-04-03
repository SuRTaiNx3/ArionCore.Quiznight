using ArionCore.Quiznight.Enums;
using ArionCore.Quiznight.Models;
using ArionCore.Quiznight.Models.Messages;
using ArionCore.Quiznight.Network;
using ArionCore.Quiznight.Utils;
using JsonFlatFileDataStore;
using log4net;
using Newtonsoft.Json;
using System.Text;

namespace ArionCore.Quiznight.Controller
{
    public class RoomController : BaseController
    {
        #region Globals

        private readonly ILog _log = LogManager.GetLogger(typeof(RoomController));

        #endregion

        #region Constructor

        public RoomController(DataStore db)
            :base(db)
        {

        }

        #endregion

        #region Methods

        public string CreateRoom()
        {
            var roomCode = GetNewRoomCode();
            Room room = new Room(roomCode);
            var roomCollection = DataBase.GetCollection<Room>();
            if (roomCollection.InsertOne(room))
                return room.Code;

            return null;
        }

        public bool DeleteRoom(string code)
        {
            var collection = DataBase.GetCollection<Room>();
            return collection.DeleteOne(r => r.Code == code);
        }

        public bool DeleteAll()
        {
            var collection = DataBase.GetCollection<Room>();
            return collection.DeleteMany(r => true);
        }


        public void JoinRoom(string code, bool isModerator, WebSocketAPI clientSocket)
        {
            var collection = DataBase.GetCollection<Room>();
            var roomToJoin = collection.Find(r => r.Code == code).FirstOrDefault();

            if (roomToJoin == null) 
            {
                _log.Error($"User '{clientSocket.Username}' tried to join room with code '{code}' but the room is not existing!");
                return;
            }

            if (isModerator)
            {
                roomToJoin.Moderator = new Player(clientSocket.Username, clientSocket.ID);
            }
            else
            {
                var existingPlayer = roomToJoin.Players.FirstOrDefault(p => p.SessionId == clientSocket.OldSessionId);
                if (existingPlayer != null) 
                {
                    existingPlayer.SessionId = clientSocket.ID;
                    existingPlayer.Username = clientSocket.Username;
                    existingPlayer.IsConnected = true;
                }
                else
                {
                    roomToJoin.Players.Add(new Player(clientSocket.Username, clientSocket.ID));
                }
            }

            collection.UpdateOne(r => r.Code == roomToJoin.Code, roomToJoin);

            var json = JsonConvert.SerializeObject(new JoinRoomResponse(roomToJoin, clientSocket.ID));
            SendToAllInRoom(roomToJoin, EMessageType.JoinRoomResponse, json);
        }

        
        public void SendPlayerAnswerToModerator(Room room, string fromSessionId, string answer)
        {
            var moderatorSocket = Core.SocketManager.GetSessionById(room.Moderator.SessionId);

            if (moderatorSocket != null)
            {
                var json = JsonConvert.SerializeObject(new PlayerAnswerUpdateResponse(fromSessionId, answer));
                moderatorSocket.SendMessage(EMessageType.PlayerAnswerUpdateResponse, json);
            }

            var player = room.GetPlayerBySessionId(fromSessionId);
            player.CurrentAnswer = Encoding.UTF8.GetString(Convert.FromBase64String(answer));

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);
        }

        public void HandleModifyPlayerScore(string sessionId, int score)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null) return;

            var index = room.Players.FindIndex(p => p.SessionId == sessionId);
            if (index == -1) return;

            room.Players[index].Score = score;

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);

            var json = JsonConvert.SerializeObject(new ModifyPlayerScoreResponse(sessionId, score));
            SendToAllInRoom(room, EMessageType.ModifyPlayerScoreResponse, json);
        }

        public void HandlePlayerClosedSession(string sessionId)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null) return;

            var index = room.Players.FindIndex(p => p.SessionId == sessionId);
            if(index == -1) return;

            room.Players.RemoveAt(index);

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);

            var json = JsonConvert.SerializeObject(new JoinRoomResponse(room, sessionId));
            SendToAllInRoom(room, EMessageType.JoinRoomResponse, json);
        }

        public void HandleBuzzerRequest(string sessionId)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null || !room.IsBuzzerOpen || room.Players.Any(p => p.HasBuzzed)) return;

            var player = room.GetPlayerBySessionId(sessionId);
            player.HasBuzzed = true;
            room.IsBuzzerOpen = false;

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);

            var json = JsonConvert.SerializeObject(new PlayerBuzzerResponse(sessionId));
            SendToAllInRoom(room, EMessageType.PlayerBuzzerResponse, json);
        }

        public void HandleBuzzerResetRequest(string sessionId)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null || room.IsBuzzerOpen) return;

            room.Players.ForEach(p => { p.HasBuzzed = false; });
            room.IsBuzzerOpen = true;

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);

            var json = JsonConvert.SerializeObject(new ResetBuzzerResponse());
            SendToAllInRoom(room, EMessageType.ResetBuzzerResponse, json);
        }

        public void HandleConfirmAnswerRequest(string sessionId, string playerSessionId, bool wasCorrect)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null || room.IsBuzzerOpen) return;

            var player = room.GetPlayerBySessionId(playerSessionId);

            if (wasCorrect)
            {
                player.Score += room.PointsCorrectAnswer;
                player.CorrectAnswers++;
            }
            else
            {
                room.Players.Where(p => p.SessionId != playerSessionId).ToList().ForEach(p => p.Score += room.PointsWrongAnswer);
                player.WrongAnswers++;
            }

            room.Players.ForEach(p => { p.HasBuzzed = false; });
            room.IsBuzzerOpen = true;

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);

            var json = JsonConvert.SerializeObject(new ConfirmAnswerResponse(room, wasCorrect));
            SendToAllInRoom(room, EMessageType.ConfirmAnswerResponse, json);
        }

        public void HandleKickRequest(string sessionId, string sessionToRemove)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null) return;

            var player = room.GetPlayerBySessionId(sessionToRemove);

            room.Players.Remove(player);

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);

            var json = JsonConvert.SerializeObject(new KickResponse(sessionToRemove));
            SendToAllInRoom(room, EMessageType.KickResponse, json);
            SendToOne(sessionToRemove, EMessageType.KickResponse, json);
        }

        public void HandleUpdatePointsSettings(int correctPoints, int wrongPoints, string sessionId)
        {
            var room = GetRoomBySessionId(sessionId);
            if (room == null) return;

            room.PointsCorrectAnswer = correctPoints;
            room.PointsWrongAnswer = wrongPoints;

            var collection = DataBase.GetCollection<Room>();
            collection.UpdateOne(r => r.Code == room.Code, room);
        }


        // --- Helpers

        private void SendToOne(string sessionId, EMessageType type, string json)
        {
            var session = Core.SocketManager.GetSessionById(sessionId);
            if(session == null) return;

            session.SendMessage(type, json);
        }

        private void SendToAllInRoom(Room room, EMessageType type, string json)
        {
            var moderatorSocket = Core.SocketManager.GetSessionById(room.Moderator.SessionId);

            if (moderatorSocket != null)
                moderatorSocket.SendMessage(type, json);

            foreach (var player in room.Players)
            {
                var socket = Core.SocketManager.GetSessionById(player.SessionId);
                if (socket != null)
                    socket.SendMessage(type, json);
            }
        }


        public Room GetRoomBySessionId(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
                return null;

            var collection = DataBase.GetCollection<Room>();
            var room = collection.Find(r => r.Moderator?.SessionId == sessionId || r.Players.Any(p => p.SessionId == sessionId)).FirstOrDefault();
            return room;
        }

        public string GetNewRoomCode()
        {
            string code = string.Empty;
            var collection = DataBase.GetCollection<Room>();
            bool isUnique = false;

            while (!isUnique)
            {
                code = StringUtils.RandomString(4);
                isUnique = !collection.AsQueryable().Any(r => r.Code == code);
            }

            return code;
        }

        #endregion
    }
}
