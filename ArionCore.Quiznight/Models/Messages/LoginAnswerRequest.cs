using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class LoginAnswerRequest : RequestMessageBase
    {
        public LoginAnswerRequest() : base(EMessageType.LoginAnswerRequest) { }
    }
}
