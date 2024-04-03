using ArionCore.Quiznight.Enums;
using ArionCore.Quiznight.Events;
using ArionCore.Quiznight.Network.Handlers;
using ArionCore.Quiznight.Utils;
using log4net;
using Newtonsoft.Json;
using System.Reflection;
using WebSocketSharp.NetCore.Server;

namespace ArionCore.Quiznight.Network
{
    public class WebSocketManager
    {
        #region Globals

        private readonly ILog _log = LogManager.GetLogger(typeof(WebSocketManager));

        private string _path = string.Empty;
        private WebSocketServer _webSocket = null;

        private List<WebSocketAPI> _sessions = new List<WebSocketAPI>();
        private List<MethodInfo> _handlerMethods = new List<MethodInfo>();

        #endregion

        #region Properties

        public bool IsListening { get { return _webSocket == null ? false : _webSocket.IsListening; } }

        public List<WebSocketAPI> Sessions { get { return _sessions; } }

        #endregion

        #region Constructor

        public WebSocketManager(string host, int port, int timeout, string path)
        {
            _path = path;

            PrepareHandlers();

            string uri = $"ws://{host}:{port}";
            _webSocket = new WebSocketServer(uri);
            _webSocket.AddWebSocketService<WebSocketAPI>(path);
            _webSocket.WaitTime = TimeSpan.FromSeconds(timeout);

            _log.Info($"WebSocket server initialized on {uri}{path} (timout: {timeout})");
        }

        #endregion

        #region Methods

        private void PrepareHandlers()
        {
            var handlerTypes = ReflectionUtility.GetListOfType<IHandler>();

            foreach (var handlerType in handlerTypes)
            {
                var methods = handlerType.GetMethods(BindingFlags.Public | BindingFlags.Static)
                    .Where(m => m.GetCustomAttributes(typeof(MessageHandlerAttribute)).Count() > 0);
                _handlerMethods.AddRange(methods);
            }
        }

        private async void ProcessMessage(EMessageType messageType, string body, WebSocketAPI session)
        {
            await Task.Run(async () =>
            {
                var method = _handlerMethods.FirstOrDefault(m => m.GetCustomAttributes<MessageHandlerAttribute>().FirstOrDefault().MessageType == messageType);
                var attribute = method.GetCustomAttributes<MessageHandlerAttribute>().FirstOrDefault();

                if (attribute == null)
                    throw new Exception($"No method found for the message type {messageType}");

                Type objType = attribute.ObjType;

                var obj = JsonConvert.DeserializeObject(body, objType);

                method.Invoke(this, new[] { obj, session });
            });
        }

        public void OnSessionAdded(WebSocketAPI session)
        {
            session.OnMessageReceived = (messageType, data) => { ProcessMessage(messageType, data, session); };
            _sessions.Add(session);
            Core.EventBus.Publish(new OnSocketSessionAddedEvent(this, session));
        }

        public void OnSessionClosed(WebSocketAPI session)
        {
            string sessionId = session.ID;
            string endPoint = session.Context.UserEndPoint.ToString();

            try
            {
                session.OnMessageReceived = null;
                _sessions.Remove(session);
                Core.EventBus.Publish(new OnSocketSessionRemovedEvent(this, session));
            }
            catch (Exception ex)
            {
                _log.Error(ex);
            }
            finally
            {
                _log.Debug($"Session({sessionId}) from {endPoint} was dropped.");
            }
        }

        public void Start()
        {
            _webSocket.Start();
            _log.Info($"WebSocket server started!");
        }

        public void Stop()
        {
            _webSocket.Stop();
            _log.Info($"WebSocket server stopped!");
        }

        public WebSocketAPI GetSessionById(string id)
        {
            return Sessions.FirstOrDefault(s => s.ID == id);
        }

        #endregion
    }
}
