using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    [Serializable]
    public class PlayerBuzzerRequest : RequestMessageBase
    {
        public long ticks;

        public PlayerBuzzerRequest(long nticks) : base(EMessageType.PlayerBuzzerRequest) { ticks = nticks; }
    }
}
