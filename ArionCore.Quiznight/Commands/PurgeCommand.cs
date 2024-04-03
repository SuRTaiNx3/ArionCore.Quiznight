using log4net;

namespace ArionCore.Quiznight.Commands
{
    public class PurgeCommand : ICommand
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(PurgeCommand));

        public string CommandToEnter { get; set; } = "purge";
        public string Description { get; set; } = "Deletes the DataStore.";
        public string Usage { get; set; } = "purge";

        public Func<string[], bool> Command { get; set; } = (args) =>
        {
            _log.Info("data.json has been purged!");
            File.Delete("data.json");
            return true;
        };
    }
}