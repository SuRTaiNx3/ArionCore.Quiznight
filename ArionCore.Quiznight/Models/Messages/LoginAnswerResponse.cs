using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class LoginAnswerResponse : ResponseMessageBase
    {
        public string player_session_id;

        public LoginAnswerResponse(string playerSessionId) : base(EMessageType.LoginAnswerResponse) 
        {
            player_session_id = playerSessionId;
        }
    }
}
