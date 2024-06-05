using log4net;
using Newtonsoft.Json;

namespace ArionCore.Quiznight.IO
{
    public class AppConfig
    {
        #region Globals

        private static readonly ILog _log = LogManager.GetLogger(typeof(AppConfig));
        private static string _configFilePath = @"config.json";

        #endregion

        #region Properties

        public static AppConfig Values { get; set; }

        public WebSocketServerConfig WebSocketServer { get; set; } = new WebSocketServerConfig();
        public RestConfig Rest { get; set; } = new RestConfig();

        #endregion

        #region Methods

        public static void Load()
        {

            try
            {
                if (!File.Exists(_configFilePath))
                {
                    CreateDefault();
                    Values.Save();
                    _log.Warn("Config file not found. Created default.");
                }
                else
                {
                    Values = JsonConvert.DeserializeObject<AppConfig>(File.ReadAllText(_configFilePath));
                }
                _log.Info($"Server config loaded from {Path.GetFullPath(_configFilePath)}");
            }
            catch (Exception ex)
            {
                _log.Error("Failed to load config.", ex);
            }
        }

        public void Save()
        {
            string json = JsonConvert.SerializeObject(this);
            File.WriteAllText(_configFilePath, json);
        }

        public static void CreateDefault()
        {
            Values = new AppConfig();
            Values.WebSocketServer = new WebSocketServerConfig();
            Values.Rest = new RestConfig();
            Values.Save();
        }

        #endregion

        #region SubClasses

        public class WebSocketServerConfig
        {
            public int Port { get; set; } = 9100;
            public string Path { get; set; } = "/api";
            public int Timeout { get; set; } = 10;

            public string SSLCertificatePath { get; set; }
            public string SSLCertificatePassword { get; set; }
        }

        public class RestConfig
        {
            public string Host { get; set; } = "localhost";
            public int Port { get; set; } = 3258;
            public bool UseSSL { get; set; } = false;
        }

        #endregion
    }
}
