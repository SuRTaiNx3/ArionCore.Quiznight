using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class ResponseMessageBase
    {
        public EMessageType type;

        public bool is_ok = true;

        public string error;

        public ResponseMessageBase() { }

        public ResponseMessageBase(EMessageType type)
        {
            this.type = type;
        }
    }
}
