using ArionCore.Quiznight.Network;
using TinyMessenger;

namespace ArionCore.Quiznight.Events
{
    public class OnSocketSessionRemovedEvent : TinyMessageBase
    {
        public WebSocketAPI Session { get; set; }

        public OnSocketSessionRemovedEvent(object sender, WebSocketAPI session)
        : base(sender)
        {
            Session = session;
        }
    }
}
