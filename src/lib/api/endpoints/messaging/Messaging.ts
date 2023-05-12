import { Client, Request } from "@henrotaym/api-client";
import { MessagingCredential } from "../../credentials";

class Messaging {
  private client: Client;

  constructor() {
    this.client = new Client().setCredential(new MessagingCredential());
  }

  public async index(
    appKey: string,
    modelType: string,
    modelId: string,
    userId: string,
    page: number,
    limit: number,
    order: string
  ) {
    const request = new Request()
      .setVerb("GET")
      .setUrl(`discussions/${appKey}/${modelType}/${modelId}`)
      .addQuery({
        create_if_not_exists: true,
        user_id: userId,
        page: page,
        limit: limit,
        order: order,
      });
    const response = await this.client.try(request);

    if (response.failed()) return [];

    return response.get()?.data || [];
  }

  public async storeMessage(
    conversationId: number,
    userId: string,
    text: string
  ) {
    const request = new Request().setVerb("POST").setUrl("messages").addData({
      conversation_id: conversationId,
      user_id: userId,
      text: text,
    });

    const response = await this.client.try(request);
    if (response.failed()) return "Cant post message";

    return response.get()?.data;
  }

  public async storeFile(
    conversationId: number,
    userId: string,
    mediaFile: any,
    mediaFileName: string
  ) {
    const request = new Request()
      .setVerb("POST")
      .setUrl("messages")
      .addData({
        conversation_id: conversationId,
        user_id: userId,
        media_file: mediaFile,
        media_filename: mediaFileName,
      })
      .asForm(true);

    const response = await this.client.try(request);
    if (response.failed()) return "Cant post file";

    return response.get()?.data;
  }

  public async storeImage(
    conversationId: number,
    userId: string,
    imageBase64: any
  ) {
    const request = new Request().setVerb("POST").setUrl("messages").addData({
      conversation_id: conversationId,
      user_id: userId,
      image_base64: imageBase64,
    });

    const response = await this.client.try(request);
    if (response.failed()) return "Cant post image";

    return response.get()?.data;
  }

  public async deleteMessage(messageId: number) {
    const request = new Request()
      .setVerb("DELETE")
      .setUrl(`messages/${messageId}`);

    const response = await this.client.try(request);
    if (response.failed()) return "Cant delete message";

    return response.get().data;
  }

  public async seeConversation(conversationId: number, userId: string) {
    const request = new Request()
      .setVerb("POST")
      .setUrl("conversations/seen")
      .addData({
        user_id: userId,
        conversation_id: conversationId,
      });

    const response = await this.client.try(request);
    if (response.failed()) return "Cant seen this conversation";

    return response.get()?.data;
  }
}

export default Messaging;
