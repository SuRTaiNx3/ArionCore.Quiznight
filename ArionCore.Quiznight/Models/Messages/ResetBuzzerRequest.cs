using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class ResetBuzzerRequest : RequestMessageBase
    {
        public ResetBuzzerRequest() : base(EMessageType.ResetBuzzerRequest) { }
    }
}
