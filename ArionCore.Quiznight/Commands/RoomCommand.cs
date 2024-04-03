using ArionCore.Quiznight.Controller;
using log4net;

namespace ArionCore.Quiznight.Commands
{
    public class RoomCommand : ICommand
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(RoomCommand));

        public string CommandToEnter { get; set; } = "room";
        public string Description { get; set; } = "Closes socket and exits the application.";
        public string Usage { get; set; } = "room <create, delete [code], clear>";

        public Func<string[], bool> Command { get; set; } = (args) =>
        {
            // Check args
            if (args == null || args.Length < 1)
                return false;

            string action = args[0].ToLowerInvariant();
            using (RoomController controller = new RoomController(Core.DataBase))
            {
                switch (action)
                {
                    case "create":
                        string newCode = controller.CreateRoom();
                        _log.Info($"Room created. Link: http://localhost?rc={newCode}&is_m=1");                        
                        break;
                    case "delete":
                        string code = args[1].ToLowerInvariant();
                        if (controller.DeleteRoom(code))
                            _log.Info($"Room deleted.");
                        else
                            _log.Info($"Room NOT deleted. Maybe wrong code?");
                        break;
                    case "clear":
                        if (controller.DeleteAll())
                            _log.Info($"All rooms deleted.");
                        else
                            _log.Info($"Rooms NOT deleted. Maybe already empty?");
                        break;
                }
            }

            return true;
        };
    }
}
