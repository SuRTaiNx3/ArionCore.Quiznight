using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class SetUsernameResponse : ResponseMessageBase
    {
        public string session_id;

        public SetUsernameResponse(string nsessionId) : base(EMessageType.SetUsernameResponse) { session_id = nsessionId; }
    }
}
