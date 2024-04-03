using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class PlayerAnswerUpdateResponse : ResponseMessageBase
    {
        public string session_id;

        public string answer;

        public PlayerAnswerUpdateResponse(string sessionId, string nanswer) : base(EMessageType.PlayerAnswerUpdateResponse)
        {
            session_id = sessionId;
            answer = nanswer;
        }
    }
}
