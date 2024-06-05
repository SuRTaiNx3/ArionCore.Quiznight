using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class ClearImageResponse : ResponseMessageBase
    {
        public ClearImageResponse() : base(EMessageType.ClearImageResponse) { }
    }
}
