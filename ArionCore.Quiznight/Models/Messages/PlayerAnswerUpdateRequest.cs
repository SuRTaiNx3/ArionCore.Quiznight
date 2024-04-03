using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class PlayerAnswerUpdateRequest : RequestMessageBase
    {
        public string answer;

        public PlayerAnswerUpdateRequest(string nanswer) : base(EMessageType.PlayerAnswerUpdateRequest) { answer = nanswer; }
    }
}
