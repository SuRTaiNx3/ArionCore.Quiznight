using ArionCore.Quiznight.Controller;
using ArionCore.Quiznight.Enums;
using ArionCore.Quiznight.Models.Messages;
using Newtonsoft.Json;

namespace ArionCore.Quiznight.Network.Handlers
{
    public class RoomHandler : IHandler
    {
        [MessageHandler(MessageType = EMessageType.SetUsernameRequest, ObjType = typeof(SetUsernameRequest))]
        public static async void SetUsernameRequest(SetUsernameRequest request, WebSocketAPI session)
        {
            session.Username = request.username;
            session.OldSessionId = request.old_session_id;

            var json = JsonConvert.SerializeObject(new SetUsernameResponse(session.ID));
            session.SendMessage(EMessageType.SetUsernameResponse, json);
        }

        [MessageHandler(MessageType = EMessageType.JoinRoomRequest, ObjType = typeof(JoinRoomRequest))]
        public static async void JoinRoomRequest(JoinRoomRequest request, WebSocketAPI session)
        {
            using(RoomController controller = new RoomController(Core.DataBase))
            {
                controller.JoinRoom(request.room_code, request.is_moderator, session);
            }
        }

        [MessageHandler(MessageType = EMessageType.PlayerAnswerUpdateRequest, ObjType = typeof(PlayerAnswerUpdateRequest))]
        public static async void PlayerAnswerUpdateRequest(PlayerAnswerUpdateRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                var room = controller.GetRoomBySessionId(session.ID);
                controller.SendPlayerAnswerToModerator(room, session.ID, request.answer);
            }
        }

        [MessageHandler(MessageType = EMessageType.PlayerBuzzerRequest, ObjType = typeof(PlayerBuzzerRequest))]
        public static async void PlayerBuzzerRequest(PlayerBuzzerRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandleBuzzerRequest(session.ID);
            }
        }

        [MessageHandler(MessageType = EMessageType.ModifyPlayerScoreRequest, ObjType = typeof(ModifyPlayerScoreRequest))]
        public static async void ModifyPlayerScoreRequest(ModifyPlayerScoreRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandleModifyPlayerScore(request.session_id, request.score);
            }
        }

        [MessageHandler(MessageType = EMessageType.UpdatePointsSettingsRequest, ObjType = typeof(UpdatePointsSettingsRequest))]
        public static async void UpdatePointsSettingsRequest(UpdatePointsSettingsRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandleUpdatePointsSettings(request.points_correct, request.points_wrong, session.ID);
            }
        }

        [MessageHandler(MessageType = EMessageType.ResetBuzzerRequest, ObjType = typeof(ResetBuzzerRequest))]
        public static async void ResetBuzzerRequest(ResetBuzzerRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandleBuzzerResetRequest(session.ID);
            }
        }

        [MessageHandler(MessageType = EMessageType.ConfirmAnswerRequest, ObjType = typeof(ConfirmAnswerRequest))]
        public static async void ConfirmAnswerRequest(ConfirmAnswerRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandleConfirmAnswerRequest(session.ID, request.player_session_id, request.was_correct);
            }
        }

        [MessageHandler(MessageType = EMessageType.KickRequest, ObjType = typeof(KickRequest))]
        public static async void KickRequest(KickRequest request, WebSocketAPI session)
        {
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandleKickRequest(session.ID, request.session_to_remove);
            }
        }
    }
}
