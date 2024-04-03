namespace ArionCore.Quiznight.Commands
{
    public class ExitCommand : ICommand
    {
        public string CommandToEnter { get; set; } = "exit";
        public string Description { get; set; } = "Closes socket and exits the application.";
        public string Usage { get; set; } = "exit";

        public Func<string[], bool> Command { get; set; } = (args) =>
        {
            Program.Instance.ExitApplication = true;
            return true;
        };
    }
}
