using ArionCore.Quiznight.IO;
using log4net;
using Nancy;
using Nancy.Hosting.Self;

namespace ArionCore.Quiznight.Network
{
    public class RestServer
    {
        #region Globals

        private readonly ILog _log = LogManager.GetLogger(typeof(RestServer));
        private NancyHost _host;

        #endregion

        #region Methods

        public void Start()
        {
            InitializeHost();
            InitializeRoutes();
        }

        public void Stop()
        {
            _host.Stop();
            _host.Dispose();
            _log.Info("REST Server was successfully stopped!");
        }

        private void InitializeHost()
        {
            HostConfiguration hostConfigs = new HostConfiguration();
            hostConfigs.UrlReservations.CreateAutomatically = true;

            string protocol = AppConfig.Values.Rest.UseSSL ? "https" : "http";
            string uri = $"{protocol}://{AppConfig.Values.Rest.Host}:{AppConfig.Values.Rest.Port}";
            _host = new NancyHost(hostConfigs, new Uri(uri));
            _host.Start();

            _log.Info($"Initialized Host on {uri}");
        }

        private void InitializeRoutes()
        {
            List<Type> types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(t => t.GetTypes()).Where(t =>
                t.IsClass && t.Namespace == "ArionCore.Quiznight.Network.Routes" && t.BaseType == typeof(NancyModule)).ToList();

            foreach (Type type in types)
                Activator.CreateInstance(type);

            _log.Info($"{types.Count} routes initialized");
        }

        #endregion
    }
}
