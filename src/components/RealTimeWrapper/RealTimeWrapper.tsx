import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import supabase from "../../helpers/supabase";
import useSession from "@/hooks/useSession";
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
					filter: `project_id=eq.${projectId}`,
				}, (data) => {
					if (data.eventType === 'UPDATE' && data.old.status !== data.new.status) {
						queryClient.invalidateQueries({
							queryKey: ["blog_posts"],
						});

						if (["completed", "ready_to_view"].includes(data.new.status)) {
							notification.success({
								message: <b>Article completed</b>,
								description: <Typography.Text><b><Link href={new URL(`${window.location.origin}/projects/${data.new.project_id}/articles/${data.new.id}`)}>{data.new.title}</Link></b> is ready to view</Typography.Text>,
								placement: 'bottomRight',
							});
						}
						if (data.new.status === "error") {
							notification.error({
								message: <b>Article error</b>,
								description: <Typography.Text>An error occured while writing <b>{data.new.title}</b> please try again</Typography.Text>,
								placement: 'bottomRight',
							});
						}
					}
				})
				.on('postgres_changes', {
					event: "INSERT",
					schema: 'public',
					table: 'blog_posts',
					filter: `project_id=eq.${projectId}`,
				}, () => {
					queryClient.invalidateQueries({
						queryKey: ["blog_posts"],
					});
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
