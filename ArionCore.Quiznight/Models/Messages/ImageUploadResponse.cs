using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class ImageUploadResponse : ResponseMessageBase
    {
        public string image_as_base64;

        public ImageUploadResponse(string imageAsBase64) : base(EMessageType.ImageUploadResponse) { image_as_base64 = imageAsBase64; }
    }
}
