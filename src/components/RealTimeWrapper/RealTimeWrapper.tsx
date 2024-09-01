"use client";;
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import supabase from "../../helpers/supabase";
import useSession from "@/hooks/useSession";
import { RealtimeChannel } from "@supabase/supabase-js";
import { App } from "antd";
import useProjectId from "@/hooks/useProjectId";
import usePricingModal from "@/hooks/usePricingModal";

let users: RealtimeChannel;
let blogPosts: RealtimeChannel;
let captions: RealtimeChannel;
let knowledges: RealtimeChannel;

const RealtimeWrapper = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const sessionStore = useSession();
	const { notification } = App.useApp()
	const projectId = useProjectId();
	const pricingModal = usePricingModal();

	useEffect(() => {
		if (sessionStore.session?.user?.id) {
			users = supabase
				.channel('users')
				.on('postgres_changes', {
					event: 'UPDATE',
					schema: 'public',
					table: 'users',
					filter: `id=eq.${sessionStore.session.user.id}`,
				}, (data) => {
					if (data.eventType === 'UPDATE') {
						queryClient.invalidateQueries({
							queryKey: ["users"],
						});
					}
					if (data.old?.subscription?.credits !== data.new?.subscription?.credits && data.new?.subscription?.credits <= 0) {
						pricingModal.open(true);
					}
				});

			blogPosts = supabase
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

						// if (["completed", "ready_to_view"].includes(data.new.status)) {
						// 	notification.success({
						// 		message: <b>Article completed</b>,
						// 		description: <Typography.Text><b><Link prefetch href={new URL(`${window.location.origin}/projects/${data.new.project_id}/articles/${data.new.id}`)}>{data.new.title}</Link></b> is ready to view</Typography.Text>,
						// 		placement: 'bottomRight',
						// 	});
						// }
						// if (data.new.status === "error") {
						// 	notification.error({
						// 		message: <b>Article error</b>,
						// 		description: <Typography.Text>An error occured while writing <b>{data.new.title}</b> please try again</Typography.Text>,
						// 		placement: 'bottomRight',
						// 	});
						// }
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
				.subscribe();

			captions = supabase
				.channel('captions')
				.on('postgres_changes', {
					event: "INSERT",
					schema: 'public',
					table: 'captions',
					filter: `project_id=eq.${projectId}`,
				}, () => {
					queryClient.invalidateQueries({
						queryKey: ["captions"],
					});
				})
				.subscribe()

			knowledges = supabase
				.channel('knowledges')
				.on('postgres_changes', {
					event: "INSERT",
					schema: 'public',
					table: 'knowledges',
					filter: `project_id=eq.${projectId}`,
				}, () => {
					queryClient.invalidateQueries({
						queryKey: ["knowledges"],
					});
				})
				.subscribe()

			return () => {
				blogPosts?.unsubscribe?.();
				captions?.unsubscribe?.();
				users?.unsubscribe?.();
				knowledges?.unsubscribe?.();
			};
		} else {
			blogPosts?.unsubscribe?.();
			captions?.unsubscribe?.();
			users?.unsubscribe?.();
			knowledges?.unsubscribe?.();
		}
	}, [queryClient, sessionStore.session?.user?.id, projectId]);

	return <>{children}</>;
};

export default RealtimeWrapper;
