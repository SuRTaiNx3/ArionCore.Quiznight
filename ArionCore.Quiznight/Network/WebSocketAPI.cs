using ArionCore.Quiznight.Controller;
using ArionCore.Quiznight.Enums;
using ArionCore.Quiznight.Extensions;
using log4net;
using WebSocketSharp.NetCore;
using WebSocketSharp.NetCore.Server;

namespace ArionCore.Quiznight.Network
{
    public class WebSocketAPI : WebSocketBehavior
    {
        #region Globals

        private readonly ILog _log = LogManager.GetLogger(typeof(WebSocketAPI));

        private DateTime _connectedSince = DateTime.Now;
        private DateTime _lastPing = DateTime.Now;

        #endregion

        #region Properties

        public string Username { get; set; }

        public Action<EMessageType, string> OnMessageReceived { get; set; }

        public DateTime ConnectedSince { get { return _connectedSince; } }
        public DateTime LastPing { get { return _lastPing; } }

        public string ClientEndpoint { get { return this.Context == null ? "-" : this.Context.UserEndPoint?.ToString(); } }

        public string OldSessionId { get; set; }

        #endregion

        #region Constructor

        public WebSocketAPI()
        {
            this.EmitOnPing = true;
            Core.SocketManager.OnSessionAdded(this);
        }

        #endregion

        #region Methods

        protected override void OnMessage(MessageEventArgs e)
        {
            if (e.IsPing)
            {
                OnPing(e);
                return;
            }

            var data = e.Data.Split("$");
            if (data.Length != 2) { throw new Exception("Fatal error! Received message with a malformed body!"); }

            int typeId = -1;
            if (!int.TryParse(data[0], out typeId))
                throw new Exception("No Message Type found!");

            EMessageType messageType = typeId.ToEnum<EMessageType>(EMessageType.None);

            if (messageType == EMessageType.None)
                throw new Exception("No Message Type found!");

            string body = data[1];

            _log.Debug($"MSG RECV | TYPE: {messageType} | LENGTH: {body.Length}");

            OnMessageReceived?.Invoke(messageType, body);
        }

        private void OnPing(MessageEventArgs e)
        {
            _lastPing = DateTime.Now;
        }

        protected override void OnOpen()
        {
            _log.Debug($"Socket connection opened from {this.Context.UserEndPoint.ToString()}!");
        }

        protected override void OnClose(CloseEventArgs e)
        {
            _log.Debug($"Connection closed! | CODE: {e.Code} | REASON: {e.Reason} | CLEAN EXIT: {e.WasClean}");

            using(RoomController controller = new RoomController(Core.DataBase))
            {
                controller.HandlePlayerClosedSession(ID);
            }

            Core.SocketManager.OnSessionClosed(this);
        }

        protected override void OnError(WebSocketSharp.NetCore.ErrorEventArgs e)
        {
            CloseSession();
            _log.Error(e.Exception);
            Core.SocketManager.OnSessionClosed(this);
        }

        public void CloseSession()
        {
            Close();
        }

        public void SendMessage(EMessageType type, string data)
        {
            if (ConnectionState == WebSocketState.Open)
            {
                var body = $"{(int)type}${data}";
                SendAsync(body, (success) =>
                {
                    _log.Debug($"MSG SENT | TYPE: {type} | SUCCESS: {success}");
                });
            }
            else
            {
                _log.Debug($"MSG ERROR | TYPE: {type} | STATE: {ConnectionState}");
            }
        }

        #endregion
    }
}
