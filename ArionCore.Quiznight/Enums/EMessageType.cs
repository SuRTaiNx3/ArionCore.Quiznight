namespace ArionCore.Quiznight.Enums
{
    public enum EMessageType
    {
        None = 0,

        SetUsernameRequest = 1,
        SetUsernameResponse = 2,
        JoinRoomRequest = 3,
        JoinRoomResponse = 4,
        LeaveRoomRequest = 5,
        LeaveRoomResponse = 6,
        PlayerAnswerUpdateRequest = 7,
        PlayerAnswerUpdateResponse = 8,
        PlayerBuzzerRequest = 9,
        PlayerBuzzerResponse = 10,
        ModifyPlayerScoreRequest = 11,
        ModifyPlayerScoreResponse = 12,
        UpdatePointsSettingsRequest = 13,
        ResetBuzzerRequest = 14,
        ResetBuzzerResponse = 15,
        ConfirmAnswerRequest = 16,
        ConfirmAnswerResponse = 17,
        KickRequest = 18,
        KickResponse = 19,
        ImageUploadRequest = 20,
        ImageUploadResponse = 21,
        ClearImageRequest = 22,
        ClearImageResponse = 23,
        ShowImageRequest = 24,
        ShowImageResponse = 25,
        LoginAnswerRequest = 26,
        LoginAnswerResponse = 27,
    }
}
