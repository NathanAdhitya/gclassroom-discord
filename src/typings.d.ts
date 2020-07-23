
/**
 * Type declarations for posting to discord's webhooks.
 */
export namespace Discord {
    interface Embed {
        /** title of embed */
        title?: string;
        /** type of embed (always "rich" for webhook embeds) */
        type?: EmbedTypes;
        /** description of embed */
        description?: string;
        /** url of embed */
        url?: string;
        /** timestamp of embed content */
        timestamp?: string;
        /** color code of the embed */
        color?: number;
        /** footer information */
        footer?: EmbedFooter;
        /** image information */
        image?: EmbedImage;
        /** thumbnail information */
        thumbnail?: EmbedThumbnail;
        /** video information */
        video?: EmbedVideo;
        /** provider information */
        provider?: EmbedProvider;
        /** author information */
        author?: EmbedAuthor;
        /** fields information */
        fields?: EmbedField[];
    }

    type EmbedTypes = "rich" | "image" | "video" | "gifv" | "article" | "link";

    interface EmbedThumbnail {
        /** source url of thumbnail (only supports http(s) and attachments) */
        url?: string;
        /** a proxied url of the thumbnail */
        proxy_url?: string;
        /** height of thumbnail */
        height?: number;
        /** width of thumbnail */
        width?: number;
    }

    interface EmbedVideo {
        /** source url of video */
        url?: string;
        /** height of video */
        height?: number;
        /** width of video */
        width?: number;
    }

    interface EmbedImage {
        /** source url of image (only supports http(s) and attachments) */
        url?: string;
        /** a proxied url of the image */
        proxy_url?: string;
        /** height of image */
        height?: number;
        /** width of image */
        width?: number;
    }

    interface EmbedProvider {
        /** name of provider */
        name?: string;
        /** url of provider */
        url?: string;
    }

    interface EmbedAuthor {
        /** name of author */
        name?: string;
        /** url of author */
        url?: string;
        /** url of author icon (only supports http(s) and attachments) */
        icon_url?: string;
        /** a proxied url of author icon */
        proxy_icon_url?: string;
    }

    interface EmbedFooter {
        /** footer text */
        text: string;
        /** url of footer icon (only supports http(s) and attachments) */
        icon_url?: string;
        /** a proxied url of footer icon */
        proxy_icon_url?: string;
    }

    interface EmbedField {
        /** name of the field */
        name: string;
        /** value of the field */
        value: string;
        /** whether or not this field should display inline */
        inline?: boolean;
    }
}