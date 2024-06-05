using ArionCore.Quiznight.Controller;
using log4net;
using Nancy;

namespace ArionCore.Quiznight.Network.Routes
{
    public class MainModule : NancyModule
    {
        private readonly ILog _log = LogManager.GetLogger(typeof(MainModule));

        public MainModule()
        {
            Before += r =>
            {
                _log.Debug($"{Request.Method} {Request.Path} FROM {Request.UserHostAddress}");
                return null;
            };

            Get("/create", async r =>
            {
                try
                {
                    using (RoomController controller = new RoomController(Core.DataBase))
                    {
                        return new { code =  controller.CreateRoom() };
                    }
                }
                catch (Exception ex)
                {
                    _log.Error($"{Request.Method} {Request.Path} {ex.Message}", ex);
                    return HttpStatusCode.InternalServerError;
                }
            });
        }
    }
}
