import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import supabase from "../../helpers/supabase";
import useSession from "@/hooks/useSession";
import queryKeys from "@/helpers/queryKeys";
import Link from "next/link";
import { RealtimeChannel } from "@supabase/supabase-js";
import { App, Typography } from "antd";
import useProjectId from "@/hooks/useProjectId";

let channel: RealtimeChannel;

const RealtimeWrapper = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const sessionStore = useSession();
	const { notification } = App.useApp()
	const projectId = useProjectId();

	React.useEffect(() => {
		if (sessionStore.session?.user?.id) {
			channel = supabase
				.channel('blog_posts')
				.on('postgres_changes', {
					event: 'UPDATE',
					schema: 'public',
					table: 'blog_posts',
					filter: `user_id=eq.${sessionStore.session.user.id}&project_id=${projectId}`,
				}, (data) => {
					console.log(data)
					if (data.eventType === 'UPDATE' && data.old.status !== data.new.status) {
						queryClient.invalidateQueries({
							queryKey: queryKeys.blogPosts(data.new.id),
						});

						if (["completed", "ready_to_view"].includes(data.new.status)) {
							notification.success({
								message: "Article completed",
								description: <Typography.Text><b><Link href={new URL(`${window.location.origin}/projects/${data.new.project_id}/articles/${data.new.id}`)}>{data.new.title}</Link></b> is ready to view</Typography.Text>,
								placement: 'topLeft',
								duration: 5000
							});
						}
						if (data.new.status === "error") {
							notification.error({
								message: "Article error",
								description: <Typography.Text>An error occured while writing <b>{data.new.title}</b> please try again</Typography.Text>,
								placement: 'topLeft',
								duration: 5000
							});
						}
					}
				})
				.subscribe()

			return () => {
				channel?.unsubscribe?.();
			};
		} else {
			channel?.unsubscribe?.();
		}
	}, [queryClient, sessionStore.session?.user?.id, projectId]);

	return <>{children}</>;
};

export default RealtimeWrapper;
