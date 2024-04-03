using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Network
{
    public class MessageHandlerAttribute : Attribute
    {
        public EMessageType MessageType { get; set; }

        public Type ObjType { get; set; }
    }
}
