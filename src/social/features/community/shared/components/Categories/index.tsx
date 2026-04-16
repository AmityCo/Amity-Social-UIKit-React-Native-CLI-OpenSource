import { TouchableOpacity, View } from 'react-native';
import FormLabel from '../../../../../elements/FormLabel';
import { useStyles } from './styles';
import { ElementID, PageID } from '../../../../../enums';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { arrowRight } from '../../../../../../core/assets/icons';
import { useBehaviour } from '../../../../../providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import CategoryChip from '../../../../../components/CategoryChip/CategoryChip';

type CategoriesProps = {
  categories: Amity.Category[];
  goBack: () => void;
  onChange: (categories: Amity.Category[]) => void;
};

function Categories({ onChange, categories, goBack }: CategoriesProps) {
  const { styles, theme } = useStyles();
  const { AmityCommunitySetupPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onAddedAction = (addedCategories: Amity.Category[]) => {
    goBack();
    onChange(addedCategories);
  };

  return (
    <View>
      <View style={styles.labelContainer}>
        <FormLabel
          optional
          pageId={PageID.community_setup_page}
          elementId={ElementID.community_category_title}
        />
      </View>
      {categories.length > 0 ? (
        <View style={styles.categoryContainer}>
          <View style={styles.selectedCategoriesContainer}>
            {categories.map((category) => (
              <CategoryChip
                category={category}
                key={category.categoryId}
                onPress={() =>
                  onChange(
                    categories.filter(
                      (cat) => cat.categoryId !== category.categoryId
                    )
                  )
                }
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (AmityCommunitySetupPageBehavior.goToAddCategoryPage) {
                return AmityCommunitySetupPageBehavior.goToAddCategoryPage({
                  categories,
                  onAddedAction,
                });
              }
              navigation.navigate('CommunityAddCategory', {
                categories,
                onAddedAction,
              });
            }}
          >
            <SvgXml
              width={20}
              height={20}
              xml={arrowRight()}
              color={theme.colors.baseShade2}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.categoryContainer}
          onPress={() => {
            if (AmityCommunitySetupPageBehavior.goToAddCategoryPage) {
              return AmityCommunitySetupPageBehavior.goToAddCategoryPage({
                categories,
                onAddedAction,
              });
            }
            navigation.navigate('CommunityAddCategory', {
              categories,
              onAddedAction,
            });
          }}
        >
          <Typography.Body style={styles.categoryText}>
            Select category
          </Typography.Body>
          <SvgXml
            width={20}
            height={20}
            xml={arrowRight()}
            color={theme.colors.baseShade2}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Categories;
