"use client";

import { getProfileDetails } from "@/actions/getProfileDetails";
import {
  acceptConnectionRequest,
  blockUser,
  rejectConnectionRequest,
  sendConnectionRequest,
  unblockUser,
} from "@/actions/userConnections";
import { ConnectionStatus } from "@/components/enum/connectionStatus";
import { UserType } from "@/components/enum/userType";
import LoadingPage from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ApiErrorPage from "@/components/apiErrorPage";
import { isAxiosError } from "axios";
import { isPaidUser } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthSession";
import { IProfileImage } from "@/components/interface/IProfileImages";
import { ProfileRedesigned } from "@/components/profile/ProfileRedesigned";


export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ profileId: string }>();

  const { user, isPending } = useAuthSession();
  const userType = user?.type as UserType;
  const isPaid = isPaidUser(userType, new Date(user?.planExpiryDate as string));

  const [requestSending, setRequestSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [unblocking, setUnblocking] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["profileDetails", params.profileId],
    queryFn: () => getProfileDetails(params.profileId),
  });

  if (isLoading || isPending) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
        <LoadingPage />
      </div>
    );
  }

  if (error) {
    const isAxios = isAxiosError(error);
    const status = isAxios ? error.response?.status : null;
    const message = isAxios
      ? error.response?.data?.message
      : "Something went wrong";

    if (status === 403) {
      return (
        <ApiErrorPage
          title="You are blocked"
          description={message || "You are not allowed to view this profile."}
          showBackButton
        />
      );
    }

    if (status === 404) {
      return (
        <ApiErrorPage
          title="Profile Not Found"
          description={message || "This user does not exist."}
        />
      );
    }

    return (
      <ApiErrorPage
        title="Failed to load profile"
        description={message || "Failed to load profile"}
      />
    );
  }

  const skinToneColor =
    data?.skinTone === "Light"
      ? "bg-[#f8d2b3]"
      : data?.skinTone === "Fair"
        ? "bg-[#ebb68f]"
        : data?.skinTone === "Medium"
          ? "bg-[#cfa07c]"
          : data?.skinTone === "Tan"
            ? "bg-[#bd7852]"
            : data?.skinTone === "Brown"
              ? "bg-[#90493d]"
              : "bg-[#3c1f1b]";

  async function handleConnectRequest() {
    setRequestSending(true);
    const requestResponse = await sendConnectionRequest(params.profileId!);
    if (requestResponse.success) {
      toast.success(requestResponse.message);
      refetch();
    } else {
      toast.error(requestResponse.message);
    }
    setRequestSending(false);
  }

  async function handleAcceptConnection(receivedRequest: string) {
    setAccepting(true);
    const requestResponse = await acceptConnectionRequest(receivedRequest);
    if (requestResponse.success) {
      toast.success(requestResponse.message);
      refetch();
    } else {
      toast.error(requestResponse.message);
    }
    setAccepting(false);
  }

  async function handleRejectConnection(receivedRequest: string) {
    setDeclining(true);
    const requestResponse = await rejectConnectionRequest(receivedRequest);
    if (requestResponse.success) {
      toast.success(requestResponse.message);
      refetch();
    } else {
      toast.error(requestResponse.message);
    }
    setDeclining(false);
  }

  async function handleBlockUser(userId: string) {
    const blockResponse = await blockUser(userId);
    if (blockResponse.success) {
      toast.success(blockResponse.message);
      refetch();
    } else {
      toast.error(blockResponse.message);
    }
  }

  async function handleUnblockUser(userId: string) {
    setUnblocking(true);
    const blockResponse = await unblockUser(userId);
    if (blockResponse.success) {
      refetch();
      toast.success(blockResponse.message);
    } else {
      toast.error(blockResponse.message);
    }
    setUnblocking(false);
  }

  const profileImage: IProfileImage = {
    id: data?.id as string,
    url: data?.avatar as string,
  };
  const profileImages = [profileImage, ...(data?.profileImages || [])];

  const isGuest = !user;
  const isFree = userType === UserType.FREE_USER || (!isGuest && !isPaid.paid);
  const isPaidMember = isPaid.paid;
  const isConnected = data?.alreadyFriend === true;
  const isPaidOrConnected = isPaidMember || isConnected;
  const isFreeOrAbove = isFree || isPaidMember || isConnected;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-gray-50/50 dark:bg-zinc-950">
      {data && (
        <ProfileRedesigned
          data={data}
          isPaidOrConnected={isPaidOrConnected}
          isFreeOrAbove={isFreeOrAbove}
          isConnected={isConnected}
          isPaid={isPaid}
          userType={userType}
          skinToneColor={skinToneColor}
          requestSending={requestSending}
          accepting={accepting}
          declining={declining}
          unblocking={unblocking}
          handleConnectRequest={handleConnectRequest}
          handleAcceptConnection={handleAcceptConnection}
          handleRejectConnection={handleRejectConnection}
          handleBlockUser={handleBlockUser}
          handleUnblockUser={handleUnblockUser}
          profileImages={profileImages}
        />
      )}
    </div>
  );
}
