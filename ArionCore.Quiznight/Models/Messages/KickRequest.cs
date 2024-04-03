using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class KickRequest : RequestMessageBase
    {
        public string session_to_remove;

        public KickRequest() : base(EMessageType.KickRequest) { }
    }
}
