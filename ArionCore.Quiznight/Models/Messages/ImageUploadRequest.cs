using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class ImageUploadRequest : RequestMessageBase
    {
        public string image_as_base64;

        public ImageUploadRequest() : base(EMessageType.ImageUploadRequest) { }
    }
}
