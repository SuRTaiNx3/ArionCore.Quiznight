namespace ArionCore.Quiznight.Commands
{
    public interface ICommand
    {
        string CommandToEnter { get; set; }

        string Description { get; set; }

        string Usage { get; set; }

        Func<string[], bool> Command { get; set; }
    }
}
