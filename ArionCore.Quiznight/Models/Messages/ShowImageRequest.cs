using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class ShowImageRequest : RequestMessageBase
    {
        public ShowImageRequest() : base(EMessageType.ShowImageRequest) { }
    }
}
