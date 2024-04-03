using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class JoinRoomRequest : RequestMessageBase
    {
        public string room_code;

        public bool is_moderator;

        public JoinRoomRequest() : base(EMessageType.JoinRoomRequest) { }
    }
}
