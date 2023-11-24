import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import supabase from "../../helpers/supabase";
import useSession from "@/hooks/useSession";
import queryKeys from "@/helpers/queryKeys";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import Link from "next/link";

const RealtimeWrapper = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const sessionStore = useSession();

	React.useEffect(() => {
		if (sessionStore.session?.user?.id) {
			const channel = supabase
				.channel("*")
				// .on(
				// 	"postgres_changes",
				// 	{
				// 		event: "UPDATE",
				// 		schema: "public",
				// 		table: "projects",
				// 		// filter: `user_id=eq.${sessionStore.session?.user?.id}`,
				// 	},
				// 	(data) => {
				// 		console.log(data)
				// 		if (data.eventType === 'UPDATE' && data.old.training !== data.new.training) {
				// 			queryClient.invalidateQueries({
				// 				queryKey: queryKeys.projects(data.new.id),
				// 			});
				// 		}
				// 	},
				// )
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "articles",
						// filter: `user_id=eq.${sessionStore.session?.user?.id}`,
					},
					(data) => {
						if (data.eventType === 'UPDATE') {
							queryClient.invalidateQueries({
								queryKey: queryKeys.article(data.new.id),
							});
						}
					},
				)
				// .on(
				// 	"postgres_changes",
				// 	{
				// 		event: "UPDATE",
				// 		schema: "public",
				// 		table: "competitors",
				// 		// filter: `user_id=eq.${sessionStore.session?.user?.id}`,
				// 	},
				// 	(data) => {
				// 		console.log(data)
				// 		if (data.eventType === 'UPDATE' && data.old.training !== data.new.training) {
				// 			console.log('invalidate competitors')
				// 			queryClient.invalidateQueries({
				// 				queryKey: queryKeys.competitors(data.new.project_id),
				// 			});
				// 		}
				// 	},
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "blog_posts",
						// filter: `user_id=eq.${sessionStore.session?.user?.id}`,
					},
					(data) => {
						if (data.eventType === 'UPDATE' && data.old.status !== data.new.status) {
							queryClient.invalidateQueries({
								queryKey: queryKeys.blogPost(data.new.id),
							});

							if (["completed", "ready_to_view"].includes(data.new.status)) {
								notifications.show({
									message: <Text><b><Link href={`/articles/${data.new.id}`}>{data.new.headline}</Link></b> is ready to view</Text>,
									autoClose: 5000,
									withCloseButton: true,
									color: "blue",
								})
							}
							if (data.new.status === "error") {
								notifications.show({
									message: <Text>An error occured while writing <b>{data.new.headline}</b> please try again</Text>,
									autoClose: 5000,
									withCloseButton: true,
									color: "red",
								})
							}
						}
					},
				)
				.subscribe();

			return () => {
				channel.unsubscribe();
			};
		}
	}, [queryClient, sessionStore.session?.user?.id]);

	return <>{children}</>;
};

export default RealtimeWrapper;
