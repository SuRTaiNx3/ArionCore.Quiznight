using Nancy.Bootstrapper;
using Nancy.Configuration;
using Nancy.Responses.Negotiation;
using Nancy.TinyIoc;
using Nancy;
using Nancy.Diagnostics;

namespace ArionCore.Quiznight.Network
{
    public class RestBootstrapper : DefaultNancyBootstrapper
    {
        public override void Configure(INancyEnvironment environment)
        {
            base.Configure(environment);
            environment.Tracing(enabled: true, displayErrorTraces: true);
            environment.Diagnostics(true, "muffin03");
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            pipelines.AfterRequest += (ctx) =>
            {
                ctx.Response.WithHeader("Access-Control-Allow-Origin", "*")
                    .WithHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS, PATCH")
                    .WithHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
                    .WithHeader("Access-Control-Allow-Private-Network", "true")
                    .WithHeader("Access-Control-Max-Age", "3600");
            };
        }

        protected override void RequestStartup(TinyIoCContainer requestContainer, IPipelines pipelines, NancyContext context)
        {
            pipelines.BeforeRequest += nancyContext =>
            {
                RequestHeaders headers = nancyContext.Request.Headers;
                if (!IsAcceptHeadersAllowed(headers.Accept))
                    return new Response() { StatusCode = HttpStatusCode.NotAcceptable };

                return null;
            };
        }

        private bool IsAcceptHeadersAllowed(IEnumerable<Tuple<string, decimal>> acceptTypes)
        {
            return acceptTypes.Any(tuple =>
            {
                var accept = new MediaRange(tuple.Item1);
                return accept.Matches("application/json") || accept.Matches("application/xml");
            });
        }
    }
}
