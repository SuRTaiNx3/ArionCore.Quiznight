using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class ConfirmAnswerResponse : ResponseMessageBase
    {
        public Room room;

        public bool was_correct;

        public ConfirmAnswerResponse(Room nroom, bool wasCorrect) : base(EMessageType.ConfirmAnswerResponse)
        {
            room = nroom;
            was_correct = wasCorrect;
        }
    }
}
