namespace ArionCore.Quiznight.Utils
{
    public static class ReflectionUtility
    {
        public static List<Type> GetListOfType<T>() where T : class
        {
            return AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(s => s.GetTypes())
                .Where(p => typeof(T).IsAssignableFrom(p) && !p.IsInterface).ToList();
        }
    }
}
