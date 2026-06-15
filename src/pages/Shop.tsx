import { useState } from 'react';
import { Coins, Shield, Magnet, Zap, Gauge, RefreshCw, Heart, ShoppingCart, Lock, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import PixelModal from '@/components/ui/PixelModal';
import MinecartPreview from '@/components/game/MinecartPreview';
import { usePlayerStore } from '@/store/usePlayerStore';
import { items as shopItems } from '@/data/items';
import { minecarts as shopMinecarts } from '@/data/minecarts';
import { cn } from '@/lib/utils';

type ShopTab = 'items' | 'minecarts';

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  type: 'item' | 'minecart';
}

const getItemIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Shield: <Shield className="w-8 h-8" />,
    Magnet: <Magnet className="w-8 h-8" />,
    Zap: <Zap className="w-8 h-8" />,
    Gauge: <Gauge className="w-8 h-8" />,
    RefreshCw: <RefreshCw className="w-8 h-8" />,
    Heart: <Heart className="w-8 h-8" />,
  };
  return iconMap[iconName] || <ShoppingCart className="w-8 h-8" />;
};

export default function Shop() {
  const [activeTab, setActiveTab] = useState<ShopTab>('items');
  const [purchaseModal, setPurchaseModal] = useState<PurchaseItem | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);

  const {
    coins,
    inventory,
    mineCarts,
    currentMineCartId,
    buyItem,
    unlockMineCart,
    selectMineCart,
  } = usePlayerStore();

  const getItemCount = (itemId: string): number => {
    const storeItem = inventory.find(i => i.id === itemId.replace('item-', ''));
    return storeItem?.count || 0;
  };

  const getMinecartUnlocked = (minecartId: string): boolean => {
    const storeMinecart = mineCarts.find(m => m.id === minecartId.replace('minecart-', ''));
    return storeMinecart?.unlocked || false;
  };

  const isMinecartSelected = (minecartId: string): boolean => {
    return currentMineCartId === minecartId.replace('minecart-', '');
  };

  const handlePurchaseClick = (item: PurchaseItem) => {
    if (coins < item.price) return;
    setPurchaseModal(item);
  };

  const confirmPurchase = () => {
    if (!purchaseModal) return;

    let success = false;

    if (purchaseModal.type === 'item') {
      const storeItemId = purchaseModal.id.replace('item-', '');
      const shopItem = shopItems.find(i => i.id === purchaseModal.id);
      if (shopItem) {
        success = buyItem(storeItemId, shopItem.price);
      }
    } else {
      success = unlockMineCart(purchaseModal.id.replace('minecart-', ''));
    }

    setPurchaseModal(null);

    if (success) {
      setSuccessModal(purchaseModal.name);
      setTimeout(() => setSuccessModal(null), 2000);
    }
  };

  const handleSelectMinecart = (minecartId: string) => {
    const storeId = minecartId.replace('minecart-', '');
    selectMineCart(storeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900">
      <PageHeader title="道具商店" showBack showCoins />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <PixelButton
            variant={activeTab === 'items' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('items')}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4" />
            道具商店
          </PixelButton>
          <PixelButton
            variant={activeTab === 'minecarts' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('minecarts')}
            className="flex-1"
          >
            <Gauge className="w-4 h-4" />
            矿车商店
          </PixelButton>
        </div>

        {activeTab === 'items' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopItems.map((item) => {
              const count = getItemCount(item.id);
              const canAfford = coins >= item.price;

              return (
                <PixelCard key={item.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'p-3 rounded-lg',
                        canAfford ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-500'
                      )}>
                        {getItemIcon(item.icon)}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-bold">{item.price}</span>
                        </div>
                        <div className="text-xs text-white/50 mt-1">
                          库存: {count}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-4 flex-grow">{item.description}</p>

                    {item.effectDuration > 0 && (
                      <div className="text-xs text-blue-400 mb-4">
                        持续时间: {item.effectDuration}秒
                      </div>
                    )}

                    <PixelButton
                      variant={canAfford ? 'primary' : 'danger'}
                      disabled={!canAfford}
                      onClick={() => handlePurchaseClick({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        type: 'item',
                      })}
                      className="w-full"
                    >
                      {canAfford ? (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          购买
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          金币不足
                        </>
                      )}
                    </PixelButton>
                  </div>
                </PixelCard>
              );
            })}
          </div>
        )}

        {activeTab === 'minecarts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopMinecarts.map((minecart) => {
              const unlocked = getMinecartUnlocked(minecart.id);
              const selected = isMinecartSelected(minecart.id);
              const canAfford = coins >= minecart.price;

              return (
                <PixelCard key={minecart.id} className="overflow-hidden">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 -mx-5 -mt-5">
                      <MinecartPreview
                        color={minecart.color}
                        speed={minecart.speed}
                        health={minecart.health}
                        name={minecart.name}
                        unlocked={unlocked}
                        price={minecart.price}
                        selected={selected}
                        showStats={false}
                        scale={1.5}
                        animate={selected}
                      />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{minecart.name}</h3>
                    <p className="text-sm text-white/60 mb-4 flex-grow">{minecart.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">速度</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-2 h-2 rounded-sm',
                                i < Math.round(minecart.speed * 3) ? 'bg-yellow-400' : 'bg-white/10'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">生命</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Heart
                              key={i}
                              className={cn(
                                'w-3 h-3',
                                i < Math.round(minecart.health / 40)
                                  ? 'text-red-400 fill-red-400'
                                  : 'text-white/10 fill-transparent'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {unlocked ? (
                      <PixelButton
                        variant={selected ? 'primary' : 'secondary'}
                        onClick={() => handleSelectMinecart(minecart.id)}
                        disabled={selected}
                        className="w-full"
                      >
                        {selected ? (
                          <>
                            <Check className="w-4 h-4" />
                            已选择
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            选择使用
                          </>
                        )}
                      </PixelButton>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-3 text-amber-400">
                          <Coins className="w-5 h-5" />
                          <span className="font-bold text-xl">{minecart.price}</span>
                        </div>
                        <PixelButton
                          variant={canAfford ? 'primary' : 'danger'}
                          disabled={!canAfford}
                          onClick={() => handlePurchaseClick({
                            id: minecart.id,
                            name: minecart.name,
                            price: minecart.price,
                            type: 'minecart',
                          })}
                          className="w-full"
                        >
                          {canAfford ? (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              解锁购买
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              金币不足
                            </>
                          )}
                        </PixelButton>
                      </>
                    )}
                  </div>
                </PixelCard>
              );
            })}
          </div>
        )}
      </div>

      <PixelModal
        isOpen={!!purchaseModal}
        onClose={() => setPurchaseModal(null)}
        title="确认购买"
      >
        {purchaseModal && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-lg text-pixel-brown-dark mb-2">
                确定要购买 <span className="font-bold text-amber-600">{purchaseModal.name}</span> 吗？
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Coins className="w-6 h-6" />
                <span className="text-2xl font-bold">{purchaseModal.price}</span>
                <span className="text-sm">金币</span>
              </div>
            </div>

            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                onClick={() => setPurchaseModal(null)}
                className="flex-1"
              >
                取消
              </PixelButton>
              <PixelButton
                variant="primary"
                onClick={confirmPurchase}
                className="flex-1"
              >
                确认购买
              </PixelButton>
            </div>
          </div>
        )}
      </PixelModal>

      <PixelModal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        closeOnOverlayClick={true}
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-xl font-bold text-pixel-brown-dark">
            购买成功！
          </p>
          <p className="text-pixel-brown-dark/70 mt-2">
            {successModal} 已添加到您的背包
          </p>
        </div>
      </PixelModal>
    </div>
  );
}
