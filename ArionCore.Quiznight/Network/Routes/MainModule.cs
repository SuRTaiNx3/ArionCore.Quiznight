using ArionCore.Quiznight.Controller;
using ArionCore.Quiznight.IO;
using log4net;
using Nancy;
using Nancy.Security;

namespace ArionCore.Quiznight.Network.Routes
{
    public class MainModule : NancyModule
    {
        private readonly ILog _log = LogManager.GetLogger(typeof(MainModule));

        public MainModule()
        {
            if(AppConfig.Values.Rest.UseSSL)
                this.RequiresHttps();

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
                        return new { code = controller.CreateRoom() };
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
