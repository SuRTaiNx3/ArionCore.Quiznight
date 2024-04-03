using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class RequestMessageBase
    {
        public EMessageType type;

        public RequestMessageBase() { }

        public RequestMessageBase(EMessageType type)
        {
            this.type = type;
        }
    }
}
