import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import supabase from "../../helpers/supabase";
import useSession from "@/hooks/useSession";
import queryKeys from "@/helpers/queryKeys";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import Link from "next/link";
import { RealtimeChannel } from "@supabase/supabase-js";

let channel: RealtimeChannel;

const RealtimeWrapper = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const sessionStore = useSession();

	React.useEffect(() => {
		if (sessionStore.session?.user?.id) {
			// 		// filter: `user_id=eq.${sessionStore.session?.user?.id}`,
			// channel = supabase
			// 	.channel('blog_posts')
			// 	.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blog_posts' }, (data) => {
			// 		console.log(data)
			// 		if (data.eventType === 'UPDATE' && data.old.status !== data.new.status) {
			// 			queryClient.invalidateQueries({
			// 				queryKey: queryKeys.blogPost(data.new.id),
			// 			});

			// 			if (["completed", "ready_to_view"].includes(data.new.status)) {
			// 				notifications.show({
			// 					id: data.new.id,
			// 					message: <Text><b><Link href={new URL(`${window.location.origin}?tab=articles&mode=edit&article=${data.new.id}`)}>{data.new.headline}</Link></b> is ready to view</Text>,
			// 					autoClose: 10000,
			// 					withCloseButton: true,
			// 					color: "blue",
			// 				})
			// 			}
			// 			if (data.new.status === "error") {
			// 				notifications.show({
			// 					id: data.new.id,
			// 					message: <Text>An error occured while writing <b>{data.new.headline}</b> please try again</Text>,
			// 					autoClose: 10000,
			// 					withCloseButton: true,
			// 					color: "red",
			// 				})
			// 			}
			// 		}
			// 	})
			// 	.subscribe()

			return () => {
				channel?.unsubscribe?.();
			};
		} else {
			channel?.unsubscribe?.();
		}
	}, [queryClient, sessionStore.session?.user?.id]);

	return <>{children}</>;
};

export default RealtimeWrapper;
