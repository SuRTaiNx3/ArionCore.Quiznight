using ArionCore.Quiznight.Network;
using TinyMessenger;

namespace ArionCore.Quiznight.Events
{
    public class OnSocketSessionAddedEvent : TinyMessageBase
    {
        public WebSocketAPI Session { get; set; }

        public OnSocketSessionAddedEvent(object sender, WebSocketAPI session)
        : base(sender)
        {
            Session = session;
        }
    }
}
