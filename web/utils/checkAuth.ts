import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

/**
 *
 * @returns
 */

export const checkAuth = () => {
  const router = useRouter();
  const { data, loading } = useMeQuery();
  useEffect(() => {
    const isInLoginOrRegisterPage =
      router.route == "/login" ||
      router.route == "/register" ||
      router.route == "/forgot-password" ||
      router.route == "/change-password";
    if (!loading && data?.Me && isInLoginOrRegisterPage) {
      router.replace("/");
    }
  }, [data, loading, router]);
  return {
    data,
    loading,
  };
};
