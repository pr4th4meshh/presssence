import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { FaExternalLinkAlt } from "react-icons/fa"
import EditButton from "./EditButton";
import SocialMediaInput from "./portfolioSocials/SocialMediaInput";
import SocialMediaCard from "./portfolioSocials/SocialMediaCard";
import { socialIcons } from "./portfolioSocials/SocialMediaIcons";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const PortfolioSocials = ({ socialMediaLinksViaPortfolio }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [socialMediaData, setSocialMediaData] = useState(() => {
    const links = socialMediaLinksViaPortfolio?.socialMedia || {};
    const order = socialMediaLinksViaPortfolio?.socialMedia?.order 
      || Object.keys(links).filter(platform => links[platform]); // auto-generate order
  
    return { links, order };
  });
  

  const { data: session } = useSession();
  const params = useParams();
  const isOwner = session?.user?.id === socialMediaLinksViaPortfolio?.userId;

  const handleInputChange = (platform: string, value: string) => {
    setSocialMediaData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            socialLinks: socialMediaData.links,
            socialLinksOrder: socialMediaData.order 
          }),
        }
      );

      if (response.ok) {
        setIsEditing(false);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update social media links");
      }
    } catch (error) {
      console.error("Error updating social media links:", error);
      alert("An error occurred while updating the social media links");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = [...socialMediaArray];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newOrder = items.map(item => item.platform);
    setSocialMediaData(prev => ({
      links: prev.links,
      order: newOrder
    }));
    
    if (isOwner) {
      try {
        await fetch(
          `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              socialLinks: socialMediaData.links,
              socialLinksOrder: newOrder 
            }),
          }
        );
      } catch (error) {
        console.error("Error saving new order:", error);
      }
    }
  };

  // Create ordered array of social media items
  const socialMediaArray = socialMediaData.order
    .filter((platform: string) => socialMediaData.links[platform])
    .map((platform: string) => ({
      platform,
      url: socialMediaData.links[platform],
      id: platform
    }));
  return (
    socialMediaArray.length > 0 && (
      <div className="py-20 container mx-auto px-4">
        <h1 className="pb-10 text-2xl uppercase text-center">Socials</h1>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(socialMediaData.links).map((platform) => (
              <SocialMediaInput
                key={platform}
                platform={platform}
                value={socialMediaData.links[platform] || ""}
                handleInputChange={handleInputChange}
              />
            ))}
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="destructive"
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white"
              >
                Cancel
              </Button>
              <Button variant="secondary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="socials" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid sm:grid-cols-5 grid-cols-3 gap-6 sm:gap-4"
                  >
                    {socialMediaArray.map(({ platform, url, id }: {
                      platform: string,
                      url: string,
                      id: string
                    }, index: number) => {
                      const Icon = socialIcons[platform as keyof typeof socialIcons] || FaExternalLinkAlt;
                      return (
                        <Draggable
                          key={id}
                          draggableId={id}
                          index={index}
                          isDragDisabled={!isOwner}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <SocialMediaCard
                                platform={platform}
                                url={url}
                                icon={Icon}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {isOwner && (
              <EditButton
                className="float-right mt-4 sm:mt-0"
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
        )}
      </div>
    )
  );
};

export default PortfolioSocials;