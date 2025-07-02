import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { useDeleteTemplateMutation } from "../app/templateApi";
import type { Template } from "../types/types";
import { useGetMyFormsQuery } from "../app/formApi";
import { ActionMenu } from "./ActionMenu/ActionMenu";


type Props = {
    item: Template;
};

export const TemplateActionsMenu = ({ item }: Props) => {
    const user = useAppSelector(state => state.auth.user);
    const isAuthor = user?.id === item.author.id;
    const isAdmin = user?.isAdmin;
    const navigate = useNavigate();
    const [deleteTemplate, { isLoading }] = useDeleteTemplateMutation();
    const { refetch } = useGetMyFormsQuery({ skip: 0 });

    if (!isAuthor && !isAdmin) return null;

    return (
        <ActionMenu
            onEdit={() => navigate(`/edit-template/${item.id}`)}
            onDelete={async () => {
                await deleteTemplate(item.id).unwrap();
                refetch();
            }}
            onStats={() =>
                navigate(`/statistic/${item.id}`, {
                    state: {
                        title: item.title,
                        description: item.description,
                    },
                })
            }
            loading={isLoading}
        />
    );
};
