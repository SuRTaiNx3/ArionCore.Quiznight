using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class SetUsernameRequest : RequestMessageBase
    {
        public string username;

        public string old_session_id;

        public SetUsernameRequest(string nusername, string oldSessionId) : base(EMessageType.SetUsernameRequest)
        {
            username = nusername;
            old_session_id = oldSessionId;
        }
    }
}
