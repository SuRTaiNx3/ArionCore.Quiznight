namespace ArionCore.Quiznight
{
    class Program
    {
        public static Core Instance { get; set; }

        static void Main(string[] args)
        {
            try
            {
                Instance = new Core();
                Instance.Startup();
            }
            catch (Exception ex)
            { 
                Console.WriteLine(ex.ToString());
            }
        }
    }
}