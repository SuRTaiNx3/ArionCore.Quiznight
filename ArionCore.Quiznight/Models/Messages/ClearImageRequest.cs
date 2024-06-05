using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class ClearImageRequest : RequestMessageBase
    {
        public ClearImageRequest() : base(EMessageType.ClearImageRequest) { }
    }
}
