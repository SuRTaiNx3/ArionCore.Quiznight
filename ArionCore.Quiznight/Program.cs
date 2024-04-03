namespace ArionCore.Quiznight
{
    class Program
    {
        public static Core Instance { get; set; }

        static void Main(string[] args)
        {
            Instance = new Core();
            Instance.Startup();
        }
    }
}