using ArionCore.Quiznight.Commands;
using ArionCore.Quiznight.Controller;
using ArionCore.Quiznight.IO;
using ArionCore.Quiznight.Network;
using ArionCore.Quiznight.Utils;
using Figgle;
using JsonFlatFileDataStore;
using log4net;
using System.Reflection;
using System.Xml;
using TinyMessenger;

namespace ArionCore.Quiznight
{
    public class Core
    {
        #region Globals

        private readonly ILog _log = LogManager.GetLogger(typeof(Core));
        private List<ICommand> _commands;

        #endregion

        #region Properties

        public bool ExitApplication { get; set; } = false;

        public static WebSocketManager SocketManager { get; set; }
        public static TinyMessengerHub EventBus { get; set; }
        public static DataStore DataBase { get; set; }

        #endregion

        #region Methods

        public void Startup()
        {
            EventBus = new TinyMessengerHub();

            InitializeLog4Net();

            DrawTitle();

            _log.Info("Server Started!");

            // Root info
            _log.Info($"Current root path for relative paths: {Directory.GetCurrentDirectory()}");

            // Load settings
            AppConfig.Load();

            // Database
            DataBase = new DataStore("data.json");
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                controller.CreateRoom();
            }

            // Socket
            SocketManager = new WebSocketManager(AppConfig.Values.WebSocketServer.Host, AppConfig.Values.WebSocketServer.Port, 3, "/api");
            SocketManager.Start();

            // Console commands loop. This call is blocking!
            LoadCommands();
            ConsoleCommandLoop();

            // The console commands loop will stop if the user exited.
            // This line will then be called.
            SocketManager.Stop();

            _log.Info("Bye bye, see ya!");
            Thread.Sleep(3000);
        }

        private void DrawTitle()
        {
            Console.WriteLine(FiggleFonts.Standard.Render("ArionCore Quiznight Backend"));

            string line = "";
            for (int i = 0; i < 100; i++)
                line += "_";
            Console.WriteLine(line);
        }

        private void InitializeLog4Net()
        {
            XmlDocument log4netConfig = new XmlDocument();
            log4netConfig.Load(File.OpenRead("log4net.config"));

            var repo = log4net.LogManager.CreateRepository(Assembly.GetEntryAssembly(), typeof(log4net.Repository.Hierarchy.Hierarchy));
            log4net.Config.XmlConfigurator.Configure(repo, log4netConfig["log4net"]);

            _log.Info("Logging initialized");
        }

        private int LoadCommands()
        {
            Type type = typeof(ICommand);
            List<Type> types = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(s => s.GetTypes())
                .Where(p => type.IsAssignableFrom(p) && !p.IsInterface).ToList();

            List<ICommand> commands = new List<ICommand>();
            foreach (Type command in types)
                commands.Add((ICommand)Activator.CreateInstance(command));
            _commands = commands;

            return _commands?.Count ?? 0;
        }

        private void ConsoleCommandLoop()
        {
            while (!ExitApplication)
            {
                Console.Write(">");
                string fullCli = Console.ReadLine();
                string[] cliArgs = fullCli?.Split(" ").Skip(1).ToArray();
                string cli = fullCli?.Split(" ").First();

                // Help page
                if (cli == "help")
                {
                    List<string[]> lines = new List<string[]> { new[] { "COMMAND", "DESCRIPTION" } };
                    foreach (ICommand command in _commands)
                        lines.Add(new[] { command.Usage, command.Description });

                    Console.WriteLine(ConsoleUtils.PadElementsInLines(lines, 5));
                    continue;
                }

                // Anything else than 'help'
                ICommand cmd = _commands.FirstOrDefault(c => c.CommandToEnter == cli);
                if (cmd == null)
                {
                    Console.WriteLine("Unknown command");
                }
                else
                {
                    // Run command
                    if (cmd.Command.Invoke(cliArgs))
                        continue;

                    // Print usage information if command was not successful
                    List<string[]> lines = new List<string[]>
                    {
                        new[] {"COMMAND", "DESCRIPTION"},
                        new[] {cmd.Usage, cmd.Description}
                    };
                    Console.WriteLine(ConsoleUtils.PadElementsInLines(lines, 5));
                }
            }

            #endregion
        }
    }
}
