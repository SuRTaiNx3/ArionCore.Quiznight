using JsonFlatFileDataStore;

namespace ArionCore.Quiznight.Controller
{
    public class BaseController : IDisposable
    {
        protected readonly DataStore DataBase;

        protected BaseController(DataStore database)
        {
            DataBase = database;
        }

        public void Dispose() { }
    }
}
