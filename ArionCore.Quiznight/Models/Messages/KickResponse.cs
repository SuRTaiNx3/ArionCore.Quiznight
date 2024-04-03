using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class KickResponse : ResponseMessageBase
    {
        public string session_to_remove;

        public KickResponse(string sessionToRemove) : base(EMessageType.KickResponse) { session_to_remove = sessionToRemove; }
    }
}
