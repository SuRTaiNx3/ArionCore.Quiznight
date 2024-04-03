using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class JoinRoomResponse : ResponseMessageBase
    {
        public Room room;

        public string joiner_session_id;

        public JoinRoomResponse(Room nroom, string nsessionId) : base(EMessageType.JoinRoomResponse) { room = nroom; joiner_session_id = nsessionId; }
    }
}
